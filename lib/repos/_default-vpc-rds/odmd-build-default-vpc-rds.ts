import {ContractsBuild} from "../../odmd-model/contracts-build";
import {ContractsEnverCdk} from "../../odmd-model/contracts-enver-cdk";
import {AnyContractsEnVer, IContractsEnver} from "../../odmd-model/contracts-enver";
import {Construct} from "constructs";
import {IPAM_AB} from "../__networking/odmd-config-networking";
import {ContractsEnverCdkDefaultVpc} from "./odmd-enver-default-vpc-rds";
import {Accounts, OndemandContracts} from "../../OndemandContracts";


export type SimpleVpc = {
    vpcName: string,
    ipamEnver: IPAM_AB,
    ipv4NetmaskLength?: number,
    defaultSubnetIpv4NetmaskLength?: number
};

export class OdmdBuildDefaultVpcRds extends ContractsBuild<ContractsEnverCdk> {

    constructor(scope: Construct) {
        super(scope, 'OdmdBuildDefaultVpcRds');
    }

    gitHubRepo = OndemandContracts.inst.githubRepos._defaultVpcRds
    ownerEmail?: string | undefined;
    readonly envers: Array<ContractsEnverCdkDefaultVpc> = []

    public getOrCreateOne(client: AnyContractsEnVer, vpc: SimpleVpc) {
        let rt =
            this.envers.find(e => e.targetAWSAccountID == client.targetAWSAccountID
                && e.targetAWSRegion == client.targetAWSRegion && e.vpcConfig.vpcName == vpc.vpcName)
        if (rt) {
            return rt
        }

        const accKey = Object.entries(OndemandContracts.inst.accounts).find(([k, v]) => v == client.targetAWSAccountID)![0] as keyof Accounts

        rt = new ContractsEnverCdkDefaultVpc(this, client.targetAWSRegion, accKey, vpc);
        this.envers.push(rt)
        return rt;
    }

}

export interface BorrowVpcRds extends IContractsEnver {
    vpcRdsProvidingEnver: ContractsEnverCdkDefaultVpc
}
