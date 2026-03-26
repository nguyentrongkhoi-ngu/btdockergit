FROM nginx:alpine

# Copy static files
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY game.js /usr/share/nginx/html/game.js

# Copy images
COPY stadium_v2.png /usr/share/nginx/html/stadium.png
COPY gk_v2.png /usr/share/nginx/html/gk.png
COPY player_v2.png /usr/share/nginx/html/player.png

EXPOSE 80
