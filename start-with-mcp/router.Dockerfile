FROM ghcr.io/apollographql/router:v2.5.0

ARG BUILD_ENV=local

COPY .apollo/router.$BUILD_ENV.yaml /config.yaml

CMD ["--config", "/config.yaml"]