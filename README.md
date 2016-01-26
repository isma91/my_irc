# my_irc
##A IRC server-client with nodeJS
This project use [nodeJS](https://nodejs.org/en/) and [npm](https://www.npmjs.com/)


Of course this project use many packages :

- [socket.io](https://www.npmjs.com/package/socket.io)
- [express](https://www.npmjs.com/package/express)
- [forever](https://www.npmjs.com/package/forever)  


And use some other packages like :  

- [Materialize](http://materializecss.com/)
- [Mui css](https://www.muicss.com/)
- [Google icon material](https://design.google.com/icons/)
- [NiceScroll](http://areaaperta.com/nicescroll/)
- [NouiSlider](http://refreshless.com/nouislider/)


To use it, just launch it with :  

```node /path/to/project/media/js/server.js```  

Or, if you have the nodejs legacy package  


```nodejs /path/to/project/media/js/server.js```  


After that you can go to your favorite web navigator and write :  

	http://localhost:1234


If you want to use it to your personnal server, you need to add a virtualhost like this :  


	LoadModule proxy_module modules/mod_proxy.so
	LoadModule proxy_http_module modules/mod_proxy_http.so
	<VirtualHost *:80>
	        ServerName yourdomain.fr
	        ServerAlias yourdomain.fr
	        <Proxy *>
	                Order deny,allow
	                Allow from all
	        </Proxy>
	        ProxyPass / http://yourdomain.fr:1234/
	        ProxyPassReverse / http://yourdomain.fr:1234/
	        ProxyPreserveHost On
	</VirtualHost>

After that you need to enable the site and restart :  

	sudo a2ensite your_conf_file
	sudo service apache2 restart
	forever start /path/to/api.js


After that you can go to your favorite web navigator and write :  

	http://yourdomain.fr

