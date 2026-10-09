FROM node:22.14.0-alpine3.21 AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM node:22.14.0-alpine3.21 AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN mkdir -p uploads/profile-images uploads/company-logos uploads/resumes && chown -R node:node uploads
USER node
EXPOSE 8000
CMD ["node", "index.js"]
