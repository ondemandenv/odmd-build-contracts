import {OdmdBuildOdmdContracts} from "./odmd-build-odmd-contracts";
import {ContractsEnverNpm} from "../../odmd-model/contracts-enver-npm";
import {OndemandContracts} from "../../OndemandContracts";
import {Construct} from "constructs";
import {SRC_Rev_REF} from "../../odmd-model/contracts-build";

const PKG_NAME_VER = `PKG_VER=$(jq -r '.version' package.json) && PKG_NAME=$(jq -r '.name' package.json)`;

export class OdmdConfigOdmdContractsNpm extends OdmdBuildOdmdContracts<ContractsEnverNpm> {
    readonly envers: Array<ContractsEnverNpm> = [
        new ContractsEnverNpm(
            this,
            OndemandContracts.inst.accounts.workplace2,
            'us-west-1',
            new SRC_Rev_REF("b", "odmdSbxUsw1"),
            [
                `npm install`,
                `npm run test`,
                `npm publish`,

                `${PKG_NAME_VER} && npm dist-tag add $PKG_NAME@$PKG_VER $GITHUB_SHA`,

                `git config user.name "odmd-pp[bot]"`,
                `git config user.email "odmd-pp@ondemandenv.dev"`,

                //will trigger webhook to update param store( version, sha, time )
                `${PKG_NAME_VER} && git tag -a "v$PKG_VER" -m "odmd" && git push origin "v$PKG_VER"`,
            ]
        )
    ];

    constructor(scope: Construct) {
        super(scope, 'odmd-contracts-npm');
    }

}