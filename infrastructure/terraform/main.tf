
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 5.0"
    }
  }
}

provider "vercel" {}

resource "vercel_project" "web" {
  name           = "beaver-savings"
  framework      = "nextjs"
  root_directory = "apps/web"
  build_command  = "cd ../.. && yarn build:web"

  git_repository = {
    type              = "github"
    repo              = "rodrigosantos003/beaver-savings"
    production_branch = "main"
  }
}

resource "vercel_project" "api" {
  name             = "beaver-savings-api"
  framework        = "nestjs"
  build_command    = "yarn install --production=false && yarn build:api"
  install_command  = "yarn install --production=false"
  output_directory = "./apps/api/dist/src/"

  git_repository = {
    type              = "github"
    repo              = "rodrigosantos003/beaver-savings"
    production_branch = "main"
  }
}
