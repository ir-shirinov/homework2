import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

async function loadWeather(isTemp) {
	const response = await fetch(meteoURL);
	const xmlTest = await response.text();
	const parser = new DOMParser();
	const currencyData = parser.parseFromString(xmlTest, "text/xml");
	const data = currencyData.querySelectorAll("FORECAST");
	const result = [];
	for (let i = 0; i < data.length; i++) {
		const weatherData = Object.create(null);
		const dataTag = data.item(i);
		if (isTemp) {
			const temp = dataTag.querySelector("TEMPERATURE");
			weatherData["tempMin"] = temp.getAttribute("min");
			weatherData["tempMax"] = temp.getAttribute("max");
		} else {
			const heat = dataTag.querySelector("HEAT");
			weatherData["tempMin"] = heat.getAttribute("min");
			weatherData["tempMax"] = heat.getAttribute("max");
		};
		weatherData['dataTime'] = `${dataTag.getAttribute("day")}.${dataTag.getAttribute("month")} - ${dataTag.getAttribute("hour")}:00` ;
		result.push(weatherData);
	};
	return result;
};

async function returnWeatherForChart(isTemp) {
   	var data = await loadWeather(isTemp);
   	const result = Object.create(null);
   	result["ArrayTempMin"] = [];
   	result["ArrayTempMax"] = [];
   	result["ArrayDataTime"] = [];
   	for (var i = data.length - 1; i >= 0; i--) {
   		result["ArrayTempMin"].unshift(data[i]["tempMin"]);
	   	result["ArrayTempMax"].unshift(data[i]["tempMax"]);
	   	result["ArrayDataTime"].unshift(data[i]["dataTime"]);
   	};
   	const dataNow = new Date();
   	result["timeNow"] = `${dataNow.getHours()}:${dataNow.getMinutes()}:${dataNow.getSeconds()}`;
	return result;
};

const buttonBuild = document.getElementById("btn");
const buttonBuildHeat = document.getElementById("btn2");
const canvasCtx = document.getElementById("out").getContext("2d");

buttonBuild.addEventListener("click", async function() {
	if (window.chart) {
		const dataWeather = await returnWeatherForChart(true);
		chart.data.labels = dataWeather["ArrayDataTime"];
		chart.data.datasets[0].data = dataWeather["ArrayTempMin"];
		chart.data.datasets[1].data = dataWeather["ArrayTempMax"];
		chart.options.title.text = `Прогноз погоды. Текущее время ${dataWeather["timeNow"]}`;
		chart.update({
	  		duration: 2000,
	  		easing: "easeInOutBack",
		});
  	} else {
		const dataWeather = await returnWeatherForChart(true);
		const chartConfig = {
			type: "line",
			data: {
			  	labels: dataWeather["ArrayDataTime"],
			  	datasets: [
					{
				  		label: "Минимальная температура",
				  		backgroundColor:"rgba(0,0,255,0.4)",
				  		borderColor:"rgba(0,0,255,0.4)",
				  		hoverBackgroundColor: "rgba(0,0,255,0.7)",
				  		data: dataWeather["ArrayTempMin"]
					}, {
						label: "Максимальная температура",
						backgroundColor:"rgba(241, 58, 19, 0.4)",
				  		hoverBackgroundColor: "rgba(241, 58, 19, 0.7)",
				  		data: dataWeather["ArrayTempMax"]
					}
			  	]
			},
			options: {
				title: {
		            display: true,
		            text: `Прогноз погоды. Текущее время ${dataWeather["timeNow"]}`,
		            position: 'bottom',
		            fontFamily: "'Alegreya Sans SC', sans-serif",
		            fontSize: 25,
		            fontColor: '#000'
		        },
		        responsive: false, 
			}
		};
		window.chart = new Chart(canvasCtx, chartConfig);
		buttonBuild.textContent = "Обновить";
		buttonBuildHeat.classList.add('show');
  	};
});


buttonBuildHeat.addEventListener("click", async function() {
	const dataWeather = await returnWeatherForChart(false);
	chart.data.datasets[0].data = dataWeather["ArrayTempMin"];
	chart.data.datasets[1].data = dataWeather["ArrayTempMax"];
	chart.options.title.text = `Прогноз погоды по ощущениям. Текущее время ${dataWeather["timeNow"]}`;
	chart.update({
  		duration: 2000,
  		easing: "easeOutBack",
	});
});

