#!/bin/sh

PATH="./"

PORT="9989"

echo "server listening on port $PORT"
./static_server.py $PATH $PORT
