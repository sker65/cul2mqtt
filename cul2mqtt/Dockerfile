ARG BUILD_FROM=ghcr.io/home-assistant/base:latest
FROM ${BUILD_FROM}

# The Supervisor builds with this folder as the context, so the app fetches the source of the
# GitHub tag v<config.yaml version> (passed as BUILD_VERSION). By hand:
#   docker build --build-arg BUILD_VERSION=1.3.0 -t cul2mqtt-app cul2mqtt
ARG BUILD_VERSION
ARG REPOSITORY=sker65/cul2mqtt

# udevadm: serialport lists ports through it (--discover, --serialport auto)
# serialport 13 ships prebuilt binaries (N-API, musl included), no toolchain needed
WORKDIR /app
RUN test -n "${BUILD_VERSION}" \
    && apk add --no-cache nodejs eudev \
    && apk add --no-cache --virtual .build npm curl \
    && curl -fsSL "https://github.com/${REPOSITORY}/archive/refs/tags/v${BUILD_VERSION}.tar.gz" \
        | tar -xz --strip-components=1 \
    && npm ci --omit=dev --no-audit --no-fund \
    && npm cache clean --force \
    && apk del .build

COPY run.sh /run.sh
RUN chmod a+x /run.sh

CMD ["/run.sh"]
