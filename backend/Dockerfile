# build stage
FROM golang:1.20-alpine AS builder

WORKDIR /app

COPY go.mod  ./
RUN go mod download

COPY . .

RUN go build -o server main.go

# run stage
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]
