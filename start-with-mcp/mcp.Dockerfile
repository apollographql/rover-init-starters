FROM ghcr.io/apollographql/apollo-mcp-server:canary-20250903T205844Z-ea32f7d

ARG BUILD_ENV=local

COPY .apollo/mcp.$BUILD_ENV.yaml /mcp.yaml

# This is only for local development in Docker
# These tools are not used in staging or production configurations
COPY tools /tools

EXPOSE 5000

CMD ["mcp.yaml"]