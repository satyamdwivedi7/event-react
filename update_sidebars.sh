#!/bin/bash
# List of HTML files that need sidebar updates
files=(
  "src/index.html"
  "src/events.html"
  "src/profile.html"
  "src/create-event.html"
  "src/browse-events.html"
  "src/event-details.html"
  "src/registered-participants.html"
  "src/view-participant.html"
  "src/edit-participant.html"
)

for file in "${files[@]}"; do
  echo "File: $file"
  grep -n "Register for Events\|Sign In\|Sign Up" "$file" | head -5
  echo "---"
done
