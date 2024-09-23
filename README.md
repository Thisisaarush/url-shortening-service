# [URL Shortning Service](https://roadmap.sh/projects/url-shortening-service)

Transforms long URLs into short URLs.

## Example Usage

- Original URL: `https://unsplash.com/photos/a-bull-with-large-horns-eating-grass-in-a-field-0XKM4QW5WUg`
- Shortened URL: `http://localhost:5000/M2v33V`

## Installation and Running the Service (Docker Recommended)

1. Clone the repository
2. Install Dependencies `npm install`
3. Run the service `npm run dev:docker` or `docker-compose up --build`
4. After installing new dependencies, run `npm run delete:docker` to remove the old docker container and image and then run `npm run dev:docker` again.

## Features

- Shorten URL
- Redirect to Original URL
- Update Original URL
- Delete Original URL
- Get Original URL
- Caching (Redis)
- Rate Limiting
- Docker & Docker Compose
- Logging (Morgan)
