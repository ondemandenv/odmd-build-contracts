docker stop n4j-contracts
docker rm -f  n4j-contracts

set "script_dir=%~dp0"
set "contracts_dir=%script_dir%\neo4j"

rmdir /s /q "%contracts_dir%"
docker run --publish=7475:7474 --publish=7688:7687 --volume="%contracts_dir%\data:/data" --env=NEO4J_AUTH=none --name n4j-contracts neo4j
