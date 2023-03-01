const fs = require("fs");

const { API_KEY, PRIVATE_KEY } = process.env;

const scheme = require("../artifacts/contracts/Coin20.sol/Coin20.json")

const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("https://goerli.infura.io/v3/" + API_KEY));

const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
const address = account.address;

// Create function for interacting with my contract
var myContract = new web3.eth.Contract(scheme.abi, "0x9205E530f14879C33E289eB34314021abEc48561", {
  from: address
});

async function createProfile(_name, _favoriteNumber, _isDating) {
  const res = myContract.methods.createProfile(_name, _favoriteNumber, _isDating);
  await res.send({
    from: address,
    gas: await res.estimateGas(),
  })
  .once("transactionHash", (hash) => {
    console.log("Resulting hash: " + hash);
  });
};

async function removeProfile() {
  const res = myContract.methods.removeProfile();
  await res.send({
    from: address,
    gas: await res.estimateGas(),
  })
  .once("transactionHash", (hash) => {
    console.log("Resulting hash: " + hash);
  });
};

async function getProfile(_addr) {
  const res = myContract.methods.getProfile(_addr);
  await res.send({
    from: address,
    gas: await res.estimateGas(),
  })
  .once("transactionHash", (hash) => {
    console.log("Resulting hash: " + hash);
  });
}

async function readEvents(address, event, filter) {
  filter["address"] = address
  return myContract.getPastEvents(
    event,
    filter,
    (error, _) => {
      if (error) {
        console.error(error);
      }
    }
  )
}

// Usage
async function test() {
  // Get my info
  console.log("My adress is " + address);
  web3.eth.getBalance(address).then((result) => {
    console.log("My balance is " + result);
  });

  await createProfile("test", 42, true);
  console.log(await getProfile(address));
  result = await readEvents(address, "GetProfile", {"fromBlock": 0,  "toBlock": "latest"});
  console.info(result[0].returnValues);
  console.info(await removeProfile(address));
}

test()
