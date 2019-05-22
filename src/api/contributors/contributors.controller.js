const fetch = require('node-fetch');

/**
 * @api {get} /contributors/ Get all Contributors
 * @apiName GetContributors
 * @apiGroup Contributor
 * @apiExample Example Usage:
 * curl -i https://api-dev.coding.garden/contributors
 *
 * @apiSuccess {String} type Data Type.
 * @apiSuccess {String} id Record ID in DB.
 * @apiSuccess {Object} attributes Contributor Data.
 * @apiSuccess {String} attributes.username Contributor ID.
 * @apiSuccess {String} attributes.name Contributor Name.
 * @apiSuccess {String} attributes.image Contributor Avatar URL.
 * @apiSuccess {String} attributes.countryCode Contributor Country Code.
 * @apiSuccess {Boolean} attributes.active Contributor Active.
 * @apiSuccess {Date} attributes.joined Contributor Joined Project.
 * @apiSuccess {Number[]} attributes.teamIds Contributor Project Teams.
 */

module.exports = async function getContributors(req, res, next) {
  const contribURL = 'https://raw.githubusercontent.com/CodingGardenCommunity/contributors/master/contributors.json';
  try {
    const response = await fetch(contribURL);
    let data = await response.json();

    if ('id' in req.params) {
      const individualData = data.filter(({ github: id }) => id === req.params.id);
      if (individualData.length > 0) data = individualData;
      else throw new RangeError('There is no contributor with the ID that you requested.');
    }

    const finalResponse = data
      .sort((a, b) => {
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
        return new Date(a.joined) - new Date(b.joined);
      })
      .map(({
        name,
        github: username,
        image,
        countryCode,
        teamIds,
        active,
        joined,
      }) => ({
        type: 'contributor',
        id: username,
        attributes: {
          username,
          name,
          image,
          countryCode,
          active,
          joined,
          teamIds,
        },
      }));
    res.json(finalResponse);
  } catch (error) {
    if (error instanceof RangeError) res.status(404);
    next(error);
  }
};
