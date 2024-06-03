import {ContractsEnverEksClusterArgoCd} from "./contracts-enver-eks-cluster";
import {ApplicationProps, AppProjectProps} from "../../imports/argocd-argoproj.io";
import {ContractsEnverCdk} from "./contracts-enver-cdk";

export abstract class ContractsEnverEcrToEksArgo extends ContractsEnverCdk {

    abstract readonly argocdEksEnv: ContractsEnverEksClusterArgoCd

    argocdProj?: AppProjectProps
    argocdApp?: ApplicationProps

}
