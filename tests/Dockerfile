FROM mcr.microsoft.com/playwright:v1.51.0-noble

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

CMD ["npx", "playwright", "test"]