import {Construct} from "constructs";
import {ContractsEnverCdkDefaultEcrEks} from "./odmd-enver-default-ecr-eks";
import {ContractsBuild} from "../../odmd-model/contracts-build";
import {ContractsEnverCdk} from "../../odmd-model/contracts-enver-cdk";
import {AnyContractsEnVer} from "../../odmd-model/contracts-enver";
import {DeploymentProps, IngressProps, JobProps, ServiceProps} from "cdk8s-plus-28";
import {ContractsEnverEksCluster} from "../../odmd-model/contracts-enver-eks-cluster";
import {OndemandContracts} from "../../OndemandContracts";

export type SimpleK8s = {
    readonly targetEksCluster: ContractsEnverEksCluster;
    readonly targetNamespace: string;

    readonly migration?: JobProps
    readonly deployment: DeploymentProps
    readonly service?: ServiceProps
    readonly ingress?: IngressProps
}

export class OdmdBuildDefaultKubeEks extends ContractsBuild<ContractsEnverCdk> {

    constructor(scope: Construct) {
        super(scope, 'DefaultKubeEks');
    }

    gitHubRepo= OndemandContracts.inst.githubRepos._defaultKubeEks
    ownerEmail?: string | undefined;
    readonly envers: Array<ContractsEnverCdkDefaultEcrEks> = []

    public getOrCreateOne(usr: AnyContractsEnVer, k8s: SimpleK8s) {
        let rt = this.envers.find(e => e.userEnver == usr)
        if (rt) {
            return rt
        }

        rt = new ContractsEnverCdkDefaultEcrEks(this, usr, k8s);
        this.envers.push(rt)
        return rt;
    }

}
