const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function () {
    ac.grant("guest").readAny("product");

    ac.grant("user")
        .extend("guest")
        .updateOwn("user")
        .updateOwn("product")
        .deleteOwn("product")
        .createAny("product")
        .createAny("request")
        .updateOwn("request");

    ac.grant("admin")
        .extend("guest")
        .extend("user")
        .updateAny("product")
        .deleteAny("product")

        .readAny("request")
        .createAny("request")
        .updateAny("request")
        .deleteAny("request")

        .readAny("user")
        .createAny("user")
        .deleteAny("user")
        .updateAny("user")

        .createAny("block")

        .createAny("category")
        .readAny("category")
        .updateAny("category")
        .deleteAny("category")

        .createAny("tags")
        .readAny("tags")
        .updateAny("tags")
        .deleteAny("tags")



    return ac;
})();
