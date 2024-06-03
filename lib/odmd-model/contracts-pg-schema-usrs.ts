import {Construct} from "constructs";
import {CustomResource, Fn, Stack} from "aws-cdk-lib";
import {OdmdNames} from "./contracts-cross-refs";
import {WithRds} from "./contracts-rds-cluster";

export function GET_PG_USR_ROLE_PROVIDER_NAME(ownerBuildId: string, ownerRegion: string, ownerAccount: string, vpcName: string) {
    //The Name field of every Export member must be specified and consist only of alphanumeric characters, colons, or hyphens.
    return `odmd-ctl-${ownerBuildId}-${ownerRegion}-${ownerAccount}-${vpcName}:pg_usr_role-provider`.replace(/[^a-zA-Z0-9:-]/g, '-');
}

export type PgUsr = {
    roleType: 'app' | 'migrate' | 'readonly';
    userName: string;
    secretName?: string;
};

export class PgSchemaUsersProps {

    public readonly enver: WithRds;
    public readonly schema: string;

    constructor(enver: WithRds, schema: string, userSecrets: PgUsr[]) {
        if (!enver.rdsConfig) {
            throw new Error('not an OwnRds')
        }
        userSecrets.forEach(u => {
            ['app', 'migrate', 'readonly'].forEach(rl => {
                if (u.userName == schema + '_' + rl) {
                    throw new Error(`pg username: ${u.userName} is reserved for special role of ${schema}`)
                }
            })
        })
        this.enver = enver;
        this.schema = schema;
        this._userSecrets = userSecrets;
    }

    private _userSecrets: PgUsr[];

    public get userSecrets(): PgUsr[] {
        this._userSecrets.forEach(us => {
            if (!us.secretName) {
                us.secretName = this.enver.owner.buildId + OdmdNames.create(this.enver, us.userName, 63 - this.enver.owner.buildId.length)
            }
        })
        return this._userSecrets;
    }

    public toJson(): string {
        return JSON.stringify({
            schema: this.schema,
            enver: {build: this.enver.owner.buildId, branch: this.enver.targetRevision},
            users: this.userSecrets
        })
    }
}

export class PgSchemaUsers extends Construct {

    constructor(scope: Stack, props: PgSchemaUsersProps, newSchema: boolean = false, serviceToken?: string) {//todo handle newSchema inside
        super(scope, 'schema_' + props.schema);

        if (scope.account.startsWith('$')) {
            throw new Error("did you initialize stack with account/region correctly thru StackProps? ")
        }

        if (!serviceToken) {
            //will pass the lambda of the rds
            serviceToken = Fn.importValue(GET_PG_USR_ROLE_PROVIDER_NAME(props.enver.vpcConfig.build.buildId, scope.region,
                scope.account, props.enver.vpcConfig?.vpcName!));
        }

        let schrole: CustomResource | undefined
        if (newSchema) {
            schrole = new CustomResource(this, `rds-usr-${props.schema}`, {
                serviceToken,
                resourceType: 'Custom::OdmdPgSchRole',
                properties: {
                    // rds: props.enver.rdsConfig.clusterIdentifier,
                    schemaName: props.schema
                }
            })
        }

        props.userSecrets.forEach(u => {
            if (!new RegExp('^[a-z][a-z0-9_]{3,63}$').test(u.userName)) {
                throw new Error("userName must up to 64 alphanumeric lower characters and _:" + u.userName)
            }
            if (u.userName.length > 64) {
                throw new Error("userName more than allowed(64):" + u.userName)
            }
            if (!u.secretName!.startsWith(props.enver.owner.buildId)) {
                throw new Error(`${props.enver.node.path} secretName has start with buildId:${props.enver.owner.buildId}`)
            }


            const cs = new CustomResource(this, `rds-usr-${props.schema}-${u.userName}`, {
                serviceToken: serviceToken!,
                resourceType: 'Custom::OdmdPgUser',
                properties: {
                    // rds: props.enver.rdsConfig.clusterIdentifier,
                    schemaName: props.schema,
                    roleType: u.roleType,
                    userName: u.userName
                }
            })

            //D:\odmd\ONDEMAND_CENTRAL_REPO\lib\pg-schema-role-user-cs\lib\user.ts
            this._usernameToSecretId.set(u.userName, cs.getAttString('userSecretId'))
            if (schrole)
                cs.node.addDependency(schrole)
        })
    }

    private _usernameToSecretId: Map<string, string> = new Map<string, string>();
    public get usernameToSecretId() {
        return this._usernameToSecretId
    }
}
