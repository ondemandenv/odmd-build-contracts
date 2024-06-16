import {OdmdBuildOdmdContracts} from "./odmd-build-odmd-contracts";
import {ContractsEnverNpm} from "../../odmd-model/contracts-enver-npm";
import {OndemandContracts} from "../../OndemandContracts";
import {Construct} from "constructs";
import {SRC_Rev_REF} from "../../odmd-model/contracts-build";

export class OdmdConfigOdmdContractsNpm extends OdmdBuildOdmdContracts<ContractsEnverNpm> {
    readonly envers: Array<ContractsEnverNpm> = [
        new ContractsEnverNpm(
            this,
            OndemandContracts.inst.accounts.workplace1,
            'us-west-1',
            new SRC_Rev_REF("b", "odmdSbxUsw1"),
            [
                'npm install',
                'npm run clean',
                'npm run build',
                'echo "@ondemandenv:registry=https://npm.pkg.github.com/" >> .npmrc',
                'echo "//npm.pkg.github.com/:_authToken=$github_token" >> .npmrc',
                'npm publish',
            ]
        )
    ];

    constructor(scope: Construct) {
        super(scope, 'odmd-contracts-npm');
    }

}