#===================================================================================================#
# Build the app
#===================================================================================================#

FROM node:13.3-alpine AS build-stage
USER node

ENV NODE_ENV=production

WORKDIR /home/node

# install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# build the app
COPY . .
RUN yarn build


#===================================================================================================#
# Serve the app through HTTP
#===================================================================================================#

FROM nginx:1.17-alpine AS production-stage

COPY --from=build-stage /home/node/dist /usr/share/nginx/html
EXPOSE 80

# generate environment config
WORKDIR /usr/share/nginx/html
COPY ./.env.sh .
COPY .env .

RUN apk add --no-cache bash
RUN chmod +x .env.sh

CMD ["/bin/sh", "-c", "/usr/share/nginx/html/.env.sh && nginx -g \"daemon off;\""]