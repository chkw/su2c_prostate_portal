#!/bin/sh

#PATH="./"

PORT="9989"

echo "server listening on port $PORT"
python ./static_server.py $PORT
