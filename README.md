# ONDEMAND_build_contracts

## This is ondemandenv.dev's example model:


###  6 repos: https://github.com/ondemandenv/odmd-build-contracts/tree/main/lib/repos
  1) __contracts, this repo that describes abstracted model of the system.
  2) __eks, the repo( not public yet ) that will deploy EKS clusters.
  3) __networking, the repo( not public yet ) that will deploy VPC, NAT, IPAM, CIDR pools, Transit gateway, Hostedzone, all these will be shared across all accounts.
  4) _default-kube-eks, the repo( not public yet ) that will deploy containers to EKS clusters deployed by __eks repo.
  5) _default-vpc-rds, the repo( not public yet ) that will deploy VPC, RDS cluster and databse/schema/users to all accounts, making sure VPC/RDS are well integrated will __networking's deployments and accessible from all accounts.
  6) sample, the Springboot app repo( not public yet ) that have muliple deployments to show how to leverage this framework/system:
      1) building two images with _default-kube-eks:
           a) migration
           b) application
      2) deploy images from previous step to EKS cluster with _default-kube-eks
      3) deploying a CDK application that contains ECS cluster, and deploy images from previous step to it.
## This is abstracted model, focus on team<-1:m->repo<-1:m->build<-1:m->service[deployment] | artifacts and providing infrastructures:
  1) describing each build's input and output and how they connected to form a dependency with code:
      1) a build can produce a value that will consume by another build, for example, networking will produce the only NAT shared by all accounts' VPC: https://github.com/ondemandenv/odmd-build-contracts/blob/ea5fd2bc92405b01006046838e5a6da3922c5afd/lib/repos/__networking/odmd-config-networking.ts#L32 and it will be consumed by eks: https://github.com/ondemandenv/odmd-build-contracts/blob/ea5fd2bc92405b01006046838e5a6da3922c5afd/lib/odmd-model/contracts-enver-eks-cluster.ts#L37 and implemented by networking code( not public yet ):  ![image](https://github.com/ondemandenv/odmd-build-contracts/assets/31018304/c84c59fe-0f1e-4700-bb9c-b0b463ca1b16) and eks code( not public yet ): ![image](https://github.com/ondemandenv/odmd-build-contracts/assets/31018304/3cc4fcce-7030-43f0-a155-af83d9985d7d)
      2) this repo defines the truth of how each build depend on each other forming a graph of nodes connected by different relationships in Neo4j:![image](https://github.com/ondemandenv/odmd-build-contracts/assets/31018304/2d2289e6-d896-457e-94a2-531b4b35d23d)
      3) Zoom in to networking's producers: <img width="968" alt="image" src="https://github.com/ondemandenv/odmd-build-contracts/assets/31018304/d2206fda-1cbb-48aa-9ea4-7f55df5404d5">
  2) Mutiple versions for each build and each version can be deployed into its own environment, the springboot app has two versions/environments, both consuming IPam pool/Transit gateway from same networking version/environment, and also produce nameservers for networking to consume to delegate DNS query: <img width="961" alt="image" src="https://github.com/ondemandenv/odmd-build-contracts/assets/31018304/44f3ba46-6552-49ac-90db-5327074a56c0">
  3) Visulize in different aspects:
      1) Dependencies
      2) Networking connections
      3) IAM chains
      4) Versioning
      5) Mutation simulations






### 4 aws accounts in code: https://github.com/ondemandenv/odmd-build-contracts/blob/0fa6afbe76e0468db447fcd9836d015bd30050bc/lib/OndemandContracts.ts#L80 My sandbox implementation has 4 accounts when deployed:
![img.png](img.png)
