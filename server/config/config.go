package config

import "github.com/spf13/viper"

type Config struct {
	Port      string `mapstructure:"PORT"`
	DbUrl     string `mapstructure:"DB_URL"`
	SecretKey string `mapstructure:"SECRET_KEY"`
}


func LoadConfig() (c Config, err error) {
	viper.SetConfigFile(".env")
	viper.SetConfigType("env")

	viper.AutomaticEnv()

	err = viper.ReadInConfig()
	if err != nil {
		return
	}

	err = viper.Unmarshal(&c)

	return
}
