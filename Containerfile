# Image for olympus-edge, where it's served at https://olympus.tailf4d52f.ts.net/monster-mash/.
# The site is static and keeps its state in the browser, so busybox's httpd serves the build.
FROM docker.io/library/node:24-alpine AS build
RUN npm install -g pnpm@12.15.0
WORKDIR /app
# olympus-edge passes the path the app is served under. The build uses a relative base, so it
# works there too; APP_BASE only switches on the platform's home-screen manifest (vite.config.ts).
ARG APP_BASE=/
ENV APP_BASE=$APP_BASE
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM docker.io/library/busybox:1.37
COPY container/httpd.conf /etc/httpd.conf
COPY --from=build /app/dist /www
# The platform's health check, as a static file.
RUN printf 'ok\n' > /www/healthz
USER 1000:1000
EXPOSE 3000
HEALTHCHECK CMD wget -qO- http://localhost:3000/healthz || exit 1
# No -v: request paths stay out of the journal. httpd as PID 1 would ignore SIGTERM and make every
# stop wait to be killed, so a shell runs it and exits on SIGTERM.
CMD ["sh", "-c", "trap 'exit 0' TERM; httpd -f -p 3000 -h /www -c /etc/httpd.conf & wait"]
