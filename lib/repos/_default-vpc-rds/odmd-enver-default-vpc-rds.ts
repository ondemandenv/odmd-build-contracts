//vpc->rds->schema->user
import {ContractsEnverCdk} from "../../odmd-model/contracts-enver-cdk";
import {ContractsIpAddresses, ContractsVpc, WithVpc} from "../../odmd-model/contracts-vpc";
import {ContractsRdsCluster} from "../../odmd-model/contracts-rds-cluster";
import {OdmdBuildDefaultVpcRds, SimpleVpc} from "./odmd-build-default-vpc-rds";
import {ContractsCrossRefConsumer, ContractsCrossRefProducer} from "../../odmd-model/contracts-cross-refs";
import {AnyContractsEnVer} from "../../odmd-model/contracts-enver";
import {PgSchemaUsersProps} from "../../odmd-model/contracts-pg-schema-usrs";
import {SRC_Rev_REF} from "../../odmd-model/contracts-build";

export class ContractsEnverCdkDefaultVpc extends ContractsEnverCdk implements WithVpc {

    readonly preCdkCmds = ['npm --prefix lib/pg-schema-role-user-cs install']

    readonly vpcConfig: ContractsVpc
    readonly rdsConfigs = [] as ContractsRdsCluster[]
    readonly nameServers: ContractsCrossRefProducer<ContractsEnverCdkDefaultVpc>

    constructor(owner: OdmdBuildDefaultVpcRds, clientAWSRegion: string, clientAWSAccountID: string,
                vpc: SimpleVpc, defaultRev: SRC_Rev_REF = new SRC_Rev_REF("b", `${clientAWSRegion}_${clientAWSAccountID}_${vpc.vpcName}`
            .replace(/[^a-zA-Z0-9_]/g, '_'))) {
        super(owner, clientAWSAccountID, clientAWSRegion, defaultRev);

        const adr = new ContractsIpAddresses(this, new ContractsCrossRefConsumer(
            this, 'addr', vpc.ipamEnver.ipamPoolName
        ), vpc.ipv4NetmaskLength, vpc.defaultSubnetIpv4NetmaskLength)

        const tgw = new ContractsCrossRefConsumer(
            this, 'tgw', vpc.ipamEnver.transitGatewayShareName
        )

        this.vpcConfig = new (class extends ContractsVpc {
            vpcName = vpc.vpcName
            transitGatewayRef = tgw
        })(adr, 'vpc');

        this.nameServers = new ContractsCrossRefProducer(this, 'ns' + vpc.vpcName)
        vpc.ipamEnver.addSubdomainServer(vpc.vpcName + '_' + this.targetAWSAccountID, this.nameServers)

    }


    getOrCreateRdsCluster(rdsId: string) {
        const t = this
        const rdsConfig = new (class extends ContractsRdsCluster {
            clusterHostname = new ContractsCrossRefProducer<AnyContractsEnVer>(t, 'clusterHostname')
            clusterPort = new ContractsCrossRefProducer<AnyContractsEnVer>(t, 'clusterPort')
            clusterSocketAddress = new ContractsCrossRefProducer<AnyContractsEnVer>(t, 'clusterSocketAddress')
        })(this.vpcConfig, rdsId)

        if (this.rdsConfigs.find(r => r.clusterIdentifier == rdsConfig.clusterIdentifier) != undefined) {
            throw new Error(`already a cluster with id: ${rdsConfig.clusterIdentifier}`)
        }
        this.rdsConfigs.push(rdsConfig)
        return rdsConfig
    }

    addSchemaUsers(rds: ContractsRdsCluster, schemaUsers: PgSchemaUsersProps) {
        if (!this.rdsConfigs.find(r => r == rds)) {
            throw new Error(`input rds is not one of this vpc's rds`)
        }

        if (rds.schemaRoleUsers.find(s => s.schema == schemaUsers.schema) != undefined) {
            throw new Error(`already schema ${schemaUsers.schema}, add your users to it instead of creating a new one`)
        }
        rds.schemaRoleUsers.push(schemaUsers)

        schemaUsers.userSecrets.forEach((us) => {
            if (rds.usernameToSecretId.has(us.userName)) {
                throw new Error(`pg username:${us.userName} already exist`)
            }
            rds.usernameToSecretId.set(us.userName, new ContractsCrossRefProducer<AnyContractsEnVer>(this, 'clusteruser-' + us.userName))
        })
    }

    getRevStackNames(): Array<string> {
        const revStr = this.targetRevision.type == 'b' ? this.targetRevision.value : this.targetRevision.toString();

        const stackName = `${this.owner.buildId}--${revStr}`;
        const rt = [stackName];
        this.rdsConfigs.forEach(r => {
            rt.push(stackName + '-' + r.clusterIdentifier)
            r.schemaRoleUsers.forEach(su => {
                rt.push(stackName + '-' + r.clusterIdentifier + '-' + su.schema)
            })
        })
        return rt.map(n => ContractsEnverCdk.SANITIZE_STACK_NAME(n))
    }
}