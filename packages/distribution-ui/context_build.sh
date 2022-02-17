#!/bin/bash

FILES=(
    "src/index.html"
    "src/styles.scss"
    "src/app/admin/dashboard-ui/dashboard-ui.component.scss"
    "src/environments/environment.ts"
    "src/environments/environment.prod.ts"
)
HOSTNAME="http://localhost:3001"

ESCAPED_HOSTNAME=$(printf '%s\n' "$HOSTNAME" | sed -e 's/[]\/$*.^[]/\\&/g')

for file in ${FILES[@]}; do
    if [ "$1" == true ]; then
        sed "s/$ESCAPED_HOSTNAME/{HOSTNAME}/g" $file >"$file.txt"
    else
        sed "s/{HOSTNAME}/$ESCAPED_HOSTNAME/g" $file >"$file.txt"
    fi
    cp "$file.txt" $file && rm -f "$file.txt"
done