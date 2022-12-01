FROM public.ecr.aws/nginx/nginx:1.19

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /www/data/frontend
COPY index.html /www/data/frontend

ARG SECRET_1
RUN echo "'Host geoserver\n\
User user\n\
HostName 38.191.191.111\n\
IdentityFile /root/${SECRET_1}'" >> /www/data/frontend/ssh_config