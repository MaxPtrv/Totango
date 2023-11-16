# Totango home assignment

## The task

Weather Data Collection and Visualization
Create a local Kubernetes-based data collection flow for weather data.
Fetch data for 5 locations every 5 minutes and store it in Elasticsearch.
there are a few free weather API's, here’s one of them: https://www.weatherapi.com/
Requirements:
- Implement the API calls in your preferred language, and send for each request the date, location, weather, and metadata (e.g pod name, node name) from each request to the data storage
- Use Kubernetes (e.g., Minikube) to implement this flow.
- Configure Elasticsearch for data storage.
- Automate the setup process with a one-click solution and send us a manual of setup instructions, for us to deploy your solution.


## My solution

### TLDR: 
run `git clone https://github.com/MaxPtrv/Totango.git &&
helm install weather-umbrella-chart .\weather-umbrella-chart`


First, I wrote a simple app that fetches data from https://api.weatherapi.com/v1/current.json using my own generated
API key and random locations I chose.
The app fetches the data right when it starts, and then it schedules a fetch every 5 minutes.
The app then adds relevant metadata like the name of the pod and the node that it runs on (or sets to unknown if it doesn't run on k8s), 
and finally sends the data to an elastic-search cluster url which is stored in an environment variable.

for reproduction, you can run `npm i && npm run`, just make sure you have the needed env vars in your environment.

Second, I dockerized the app, you can reproduce by running ` docker build -t weather-app:latest .`, but don't bother because 
I already packed it into my public Dockerhub registry named "maximgtoy".

Then I created a helm chart for the app, which includes the app configured in a k8s deployment file, and I added a small 
initContainer which will only wait 60 seconds before starting the app in order to give the elastic-search cluster time to go up.

For the final part, I created a helm umbrella chart with my apps helm chart and the elasticsearch cluster helm chart as sub charts.
I did some tweaks to the StatedfulSet and the values of the elastic-search chart, Just so they can work as I wanted
(single-node cluster, no SSL because certs gave me a lot of pain) so feel free to toggle.

### The outcome:

What we have here is an umbrella chart that packs my app and an elastic-search cluster, and my app is already configured to
work with the elasticsearch cluster!.

So all you need to do in order to reproduce all my work here, is to run:

`helm install weather-umbrella-chart .\weather-umbrella-chart`

And voilà! we have all the requests up and running! :tada:
