import {ContractsEnverCdk} from "../../odmd-model/contracts-enver-cdk";
import {OdmdBuildDefaultKubeEks, SimpleK8s} from "./odmd-build-default-kube-eks";
import {SRC_Rev_REF} from "../../odmd-model/contracts-build";
import {AnyContractsEnVer, IContractsEnver} from "../../odmd-model/contracts-enver";
import {KubeCtlThruCentral} from "../../odmd-model/contracts-enver-eks-cluster";

export class ContractsEnverCdkDefaultEcrEks extends ContractsEnverCdk implements KubeCtlThruCentral{


    constructor(owner: OdmdBuildDefaultKubeEks, user: AnyContractsEnVer,
                k8s: SimpleK8s, defaultRev = new SRC_Rev_REF("b", user.targetRevision.value)) {
        //always to user's account, so that it can be taken over by user
        super(owner, user.targetAWSAccountID, process.env.CDK_DEFAULT_REGION!, defaultRev);
        this.userEnver = user
        this.simpleK8s = k8s

    }

    public readonly userEnver: IContractsEnver
    public readonly simpleK8s


}