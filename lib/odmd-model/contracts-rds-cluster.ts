import {
    AuroraPostgresEngineVersion,
    DatabaseClusterEngine,
    IClusterEngine,
    IParameterGroup,
    ServerlessScalingOptions
} from "aws-cdk-lib/aws-rds";
import {RemovalPolicy} from "aws-cdk-lib";
import {PgSchemaUsersProps} from "./contracts-pg-schema-usrs";
import {ContractsVpc, WithVpc} from "./contracts-vpc";
import {ContractsCrossRefProducer, OdmdNames} from "./contracts-cross-refs";
import {AnyContractsEnVer} from "./contracts-enver";

export class ContractsRdsCluster {


    constructor(vpc: ContractsVpc, id: string = 'db') {
        this.vpc = vpc;

        this.clusterIdentifier = (vpc.vpcName + '-rds-' + id).toLowerCase().replace(/[^a-z0-9\-]+/g, '')

        this.rootSecretName = OdmdNames.create(vpc.build, vpc.vpcName + id + 'secret')

        this.defaultSgName = OdmdNames.create(vpc.build, vpc.vpcName + id + 'security')
    }

    public readonly vpc: ContractsVpc;
    public readonly clusterIdentifier: string
    public readonly rootSecretName: string;
    public readonly defaultSgName: string;
    public readonly defaultDatabaseName: string = 'defaultDatabaseName';
    public readonly rootUsername: string = 'pgadmin';
    public readonly scaling: ServerlessScalingOptions = {minCapacity: 2, maxCapacity: 8};
    public readonly engine: IClusterEngine = DatabaseClusterEngine.auroraPostgres({version: AuroraPostgresEngineVersion.VER_13_13});
    public readonly enableDataApi: boolean = false;
    public readonly removalPolicy: RemovalPolicy = RemovalPolicy.DESTROY;
    public readonly parameterGroup: IParameterGroup;
    public readonly copyTagsToSnapshot: boolean = true;
    public readonly schemaRoleUsers = [] as PgSchemaUsersProps[];

    public readonly clusterHostname: ContractsCrossRefProducer<AnyContractsEnVer>
    public readonly clusterPort: ContractsCrossRefProducer<AnyContractsEnVer>
    public readonly clusterSocketAddress: ContractsCrossRefProducer<AnyContractsEnVer>
    // public readonly clusterReadHostname: ContractsCrossRefProducer<AnyContractsEnVer>
    // public readonly clusterReadPort: ContractsCrossRefProducer<AnyContractsEnVer>
    // public readonly clusterReadSocketAddress: ContractsCrossRefProducer<AnyContractsEnVer>

    public readonly usernameToSecretId = new Map<string, ContractsCrossRefProducer<AnyContractsEnVer>>()
}


export interface WithRds extends WithVpc {
    readonly rdsConfig: ContractsRdsCluster
}