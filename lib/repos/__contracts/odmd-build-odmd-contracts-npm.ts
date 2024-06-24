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
                'npm publish',
                // 'npm publish --tag $GITHUB_SHA',
                'git config user.name "github-actions[bot]"',
                'git config user.email "bot@ondemandenv.dev"',
                'VERSION=$(jq -r \'.version\' package.json) && git tag -a "v$VERSION" -m "odmd" && git push origin "v$VERSION"',
            ]
        )
    ];

    constructor(scope: Construct) {
        super(scope, 'odmd-contracts-npm');
    }

}
/*
*
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git tag -a "v${{ steps.get_version.outputs.version }}" -m "Release ${{ steps.get_version.outputs.version }}"
          git push origin --tags*/