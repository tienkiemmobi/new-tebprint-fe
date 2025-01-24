#!/bin/bash

while true; do
    pnpm run dev
    exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo "pnpm run dev exited successfully."
    else
        echo "pnpm run dev exited with an error. Auto restarting..."
    fi

    # sleep 2  # Wait for a few seconds before restarting
done
