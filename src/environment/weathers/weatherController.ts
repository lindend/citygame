import { Game } from "../../game/game";
import { EmptyWeather } from "./empty";
import { HeavyRain, LightRain, Rain } from "./rain";
import { IWeather } from "./weather";

const minWeatherDuration = 10;
const maxWeatherDuration = 24;

export enum Weather {
  Sunny,
  Cloudy,
  Overcast,
  Rain,
  HeavyRain,
  Thunderstorm,
  Foggy,
  Snowy,
}

const weathers = [
  Weather.Sunny,
  Weather.Cloudy,
  Weather.Overcast,
  Weather.Rain,
  Weather.HeavyRain,
  Weather.Thunderstorm,
  Weather.Foggy,
];

function randomWeather() {
  const weatherIdx = weathers[Math.floor(Math.random() * weathers.length)];
  const duration =
    Math.random() * (maxWeatherDuration - minWeatherDuration) +
    minWeatherDuration;
  return [Weather.HeavyRain, duration];
  return [weathers[weatherIdx], duration];
}

export class WeatherController {
  private weather: Weather;
  private weatherDuration: number;
  private previousTime: number;

  private weathers: { [key in Weather]: IWeather };

  constructor(private game: Game) {
    this.weathers = {
      [Weather.Sunny]: new EmptyWeather(),
      [Weather.Cloudy]: new EmptyWeather(),
      [Weather.Overcast]: new EmptyWeather(),
      [Weather.Rain]: new Rain(LightRain, game),
      [Weather.HeavyRain]: new Rain(HeavyRain, game),
      [Weather.Thunderstorm]: new EmptyWeather(),
      [Weather.Foggy]: new EmptyWeather(),
      [Weather.Snowy]: new EmptyWeather(),
    };

    const [weather, duration] = randomWeather();
    this.weather = weather;
    this.weatherDuration = duration;
    this.previousTime = game.time.getTime();

    this.weathers[this.weather].activate();
  }

  update(delta: number) {
    const timeDiff = this.game.time.getTime() - this.previousTime;
    this.previousTime = this.game.time.getTime();
    this.weatherDuration -= timeDiff;

    if (this.weatherDuration < 0) {
      this.weathers[this.weather].deactivate();
      const [weather, duration] = randomWeather();
      this.weather = weather;
      this.weatherDuration = duration;
      this.weathers[this.weather].activate();
    }

    this.weathers[this.weather].update(delta);
  }
}
