# build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod ./
# 外部依存がないので go mod tidy しても問題なし
RUN go mod tidy

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o server main.go

# run stage
FROM alpine:latest

WORKDIR /app
RUN apk --no-cache add ca-certificates

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]
