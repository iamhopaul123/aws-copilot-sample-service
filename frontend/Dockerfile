FROM public.ecr.aws/nginx/nginx:1.19

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /www/data/front-end
COPY index.html /www/data/front-end