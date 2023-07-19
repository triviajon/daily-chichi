# daily-chichi
a web-app for automatically posting to instagram (work in progress)

## usage
set up the express server to run in the background. something like a raspberry pi should be fine but anything works. then, access to client homepage to create your post. there will be fields for image, name, and caption as such:

![image](https://github.com/triviajon/daily-chichi/assets/16440342/fd4c971d-0d83-484f-a22e-fa0c3ddf5fc7)

this will add your post to a queue-like structure managed by the server. the server selects a random post in its queue to post at a regular interval. 

## concept

this was originally meant as a way to post daily pictures of my cat chichi to my instagram, but could be used in other contexts as well. the service is still incomplete, so stay tuned. 
