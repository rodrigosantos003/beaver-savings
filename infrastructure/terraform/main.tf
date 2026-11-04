
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 5.0"
    }

    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "~> 2.2"
    }
  }
}

provider "vercel" {}
provider "mongodbatlas" {}


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

resource "mongodbatlas_advanced_cluster" "beaver_savings" {
  project_id   = "6a81c1bdc184ca88f14dfe30"
  name         = "Cluster0"
  cluster_type = "REPLICASET"

  replication_specs = [
    {
      region_configs = [
        {
          provider_name         = "TENANT"
          backing_provider_name = "AWS"
          region_name           = "EU_CENTRAL_1"
          priority              = 7
          electable_specs = {
            instance_size = "M0"
          }
        }
      ]
    }
  ]
}