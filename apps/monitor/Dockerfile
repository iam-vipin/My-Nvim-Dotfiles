FROM --platform=$BUILDPLATFORM tonistiigi/binfmt AS binfmt

FROM golang:1.25.4-alpine3.22 AS build
WORKDIR /app

RUN apk update && \
	apk upgrade && \
	apk add git build-base && \
	go install github.com/goreleaser/goreleaser/v2@v2.13.0

ARG PRIVATE_KEY
ENV PRIVATE_KEY=$PRIVATE_KEY

COPY . .

RUN goreleaser build --snapshot --clean --single-target --output=./prime-monitor

FROM alpine:latest AS run
WORKDIR /app
COPY --from=build /app/prime-monitor /usr/local/bin/prime-monitor

COPY LICENSE.txt .
RUN mkdir -p /usr/share/licenses/plane/
COPY LICENSE.txt /usr/share/licenses/plane/LICENSE.txt

CMD [ "prime-monitor", "start" ]

