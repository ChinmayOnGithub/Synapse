# Simple Terraform example - AWS S3 bucket and IAM user
# Run: terraform init → terraform plan → terraform apply

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# S3 bucket for static assets
resource "aws_s3_bucket" "synapse_assets" {
  bucket = "synapse-assets-bucket-unique-name"
}

# IAM user for programmatic access
resource "aws_iam_user" "synapse_user" {
  name = "synapse-app-user"
}

# IAM policy for S3 access
resource "aws_iam_user_policy" "s3_access" {
  name = "s3-access"
  user = aws_iam_user.synapse_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["s3:GetObject", "s3:PutObject", "s3:ListBucket"]
      Resource = [
        aws_s3_bucket.synapse_assets.arn,
        "${aws_s3_bucket.synapse_assets.arn}/*"
      ]
    }]
  })
}

output "bucket_name" {
  value = aws_s3_bucket.synapse_assets.id
}

output "iam_user" {
  value = aws_iam_user.synapse_user.name
}
