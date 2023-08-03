import { Game } from "../../game/game";
import { Cloudy, LightCoverage, OvercastCoverage } from "./cloudy";
import { Sunny } from "./sunny";
import { HeavyRain, LightRain, Rain } from "./rain";
import { IWeather, WeatherEnvironment } from "./weather";
import { lerp, progress } from "../../math";
import { Color4 } from "@babylonjs/core/Maths/math.color";

const minWeatherDuration = 10;
const maxWeatherDuration = 24;
const weatherFadeDuration = 2;

export enum Weather {
  Sunny,
  Cloudy,
  Overcast,
  Rain,
  HeavyRain,
}

const weathers = [
  Weather.Sunny,
  Weather.Cloudy,
  Weather.Overcast,
  Weather.Rain,
  Weather.HeavyRain,
];

function randomWeather() {
  const weatherIdx = weathers[Math.floor(Math.random() * weathers.length)];
  const duration =
    Math.random() * (maxWeatherDuration - minWeatherDuration) +
    minWeatherDuration;
  return [weathers[weatherIdx], duration];
}

export class WeatherController {
  private weather: Weather;
  private previousWeather: Weather;
  private weatherDuration: number;
  private remainingFadeDuration: number = 1;
  private isFading = true;
  private currentWeatherEnvironment: WeatherEnvironment;
  private previousWeatherEnvironment: WeatherEnvironment;

  private weathers: { [key in Weather]: IWeather };

  constructor(private game: Game) {
    this.weathers = {
      [Weather.Sunny]: new Sunny(),
      [Weather.Cloudy]: new Cloudy(LightCoverage, game),
      [Weather.Overcast]: new Cloudy(OvercastCoverage, game),
      [Weather.Rain]: new Rain(LightRain, LightCoverage, game),
      [Weather.HeavyRain]: new Rain(HeavyRain, OvercastCoverage, game),
    };

    const [weather, duration] = randomWeather();
    this.weather = weather;
    this.previousWeather = weather;
    this.weatherDuration = duration;

    this.currentWeatherEnvironment = this.weathers[this.weather].activate();
    this.previousWeatherEnvironment = this.currentWeatherEnvironment;
  }

  update(delta: number) {
    this.weatherDuration -= this.game.time.getDeltaTime();
    this.remainingFadeDuration -= this.game.time.getDeltaTime();

    if (this.weatherDuration < 0) {
      const [weather, duration] = randomWeather();
      this.previousWeather = this.weather;
      this.weather = weather;
      this.weatherDuration = duration;
      this.previousWeatherEnvironment = this.currentWeatherEnvironment;
      this.currentWeatherEnvironment = this.weathers[this.weather].activate();
      if (this.weather != this.previousWeather) {
        this.isFading = true;
        this.remainingFadeDuration = weatherFadeDuration;
      }
    }

    if (this.isFading) {
      const fadeProgress = progress(
        this.remainingFadeDuration,
        weatherFadeDuration,
        0
      );

      this.weathers[this.previousWeather].setIntensity(1 - fadeProgress);
      this.weathers[this.weather].setIntensity(fadeProgress);
      const prev = this.previousWeatherEnvironment;
      const curr = this.currentWeatherEnvironment;
      this.game.sky.setSkyColor(
        Color4.Lerp(prev.skyColor, curr.skyColor, fadeProgress),
        "weather",
        2
      );
      this.game.sky.setSunColor(
        Color4.Lerp(prev.sunColor, curr.sunColor, fadeProgress),
        "weather",
        1
      );
      this.game.sky.setAmbientColor(
        Color4.Lerp(prev.ambientColor, curr.ambientColor, fadeProgress),
        "weather",
        1
      );
      this.game.sky.setSkyColorIntensity(
        lerp(prev.skyIntensity, curr.skyIntensity, fadeProgress),
        "weather",
        1
      );
      this.game.sky.setSunIntensity(
        lerp(prev.sunIntensity, curr.sunIntensity, fadeProgress),
        "weather",
        1
      );
      this.game.sky.setAmbientIntensity(
        lerp(prev.ambientIntensity, curr.ambientIntensity, fadeProgress),
        "weather",
        1
      );

      if (this.remainingFadeDuration <= 0) {
        this.isFading = false;
      }
    }

    this.weathers[this.weather].update(delta);
  }
}
