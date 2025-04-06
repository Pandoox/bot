import { formatSeconds, showConsoleLibraryError } from '../utils/general.util.js';
import ytdl from '@distube/ytdl-core';
import { instagramGetUrl } from 'instagram-url-direct';
import { getFbVideoInfo } from 'fb-downloader-scrapper';
import Tiktok from '@tobyg74/tiktok-api-dl';
import axios from 'axios';
import yts from 'yt-search';
import getBotTexts from '../utils/bot.texts.util.js';
export async function xMedia(url) {
    try {
        const newURL = url.replace(/twitter\.com|x\.com/g, 'api.vxtwitter.com');
        const { data: xResponse } = await axios.get(newURL);
        if (!xResponse.media_extended) {
            return null;
        }
        const xMedia = {
            text: xResponse.text,
            media: xResponse.media_extended.map((media) => {
                return {
                    type: (media.type === 'video') ? 'video' : 'image',
                    url: media.url
                };
            })
        };
        return xMedia;
    }
    catch (err) {
        showConsoleLibraryError(err, 'xMedia');
        throw new Error(getBotTexts().library_error);
    }
}
export async function tiktokMedia(url) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    try {
        const tiktokResponse = await Tiktok.Downloader(url, { version: "v1" });
        if (tiktokResponse.status === 'error') {
            return null;
        }
        const tiktokMedia = {
            author_profile: (_a = tiktokResponse.result) === null || _a === void 0 ? void 0 : _a.author.nickname,
            description: (_b = tiktokResponse.result) === null || _b === void 0 ? void 0 : _b.description,
            type: (((_c = tiktokResponse.result) === null || _c === void 0 ? void 0 : _c.type) === "video") ? "video" : "image",
            duration: ((_d = tiktokResponse.result) === null || _d === void 0 ? void 0 : _d.type) == "video" ? parseInt((((_f = (_e = tiktokResponse.result) === null || _e === void 0 ? void 0 : _e.video) === null || _f === void 0 ? void 0 : _f.duration) / 1000).toFixed(0)) : null,
            url: ((_g = tiktokResponse.result) === null || _g === void 0 ? void 0 : _g.type) == "video" ? (_j = (_h = tiktokResponse.result) === null || _h === void 0 ? void 0 : _h.video) === null || _j === void 0 ? void 0 : _j.playAddr[0] : (_k = tiktokResponse.result) === null || _k === void 0 ? void 0 : _k.images
        };
        return tiktokMedia;
    }
    catch (err) {
        showConsoleLibraryError(err, 'tiktokMedia');
        throw new Error(getBotTexts().library_error);
    }
}
export async function facebookMedia(url) {
    try {
        const facebookResponse = await getFbVideoInfo(url);
        const facebookMedia = {
            url: facebookResponse.url,
            duration: parseInt((facebookResponse.duration_ms / 1000).toFixed(0)),
            sd: facebookResponse.sd,
            hd: facebookResponse.hd,
            title: facebookResponse.title,
            thumbnail: facebookResponse.thumbnail
        };
        return facebookMedia;
    }
    catch (err) {
        showConsoleLibraryError(err, 'facebookMedia');
        throw new Error(getBotTexts().library_error);
    }
}
export async function instagramMedia(url) {
    try {
        const instagramResponse = await instagramGetUrl(url);
        let instagramMedia = {
            author_username: instagramResponse.post_info.owner_username,
            author_fullname: instagramResponse.post_info.owner_fullname,
            caption: instagramResponse.post_info.caption,
            likes: instagramResponse.post_info.likes,
            media: []
        };
        for (const url of instagramResponse.url_list) {
            const { headers } = await axios.head(url);
            const type = headers['content-type'] === 'video/mp4' ? 'video' : 'image';
            instagramMedia.media.push({ type, url });
        }
        return instagramMedia;
    }
    catch (err) {
        showConsoleLibraryError(err, 'instagramMedia');
        throw new Error(getBotTexts().library_error);
    }
}
export async function youtubeMedia(text) {
    try {
        const yt_agent = ytdl.createAgent([{
                name: 'cookie1',
                value: 'GPS=1; YSC=CkypMSpfgiI; VISITOR_INFO1_LIVE=4nF8vxPW1gU; VISITOR_PRIVACY_METADATA=CgJCUhIEGgAgZA%3D%3D; PREF=f6=40000000&tz=America.Sao_Paulo;' +
                    'SID=g.a000lggw9yBHfdDri-OHg79Bkk2t6L2X7cbwK7jv8BYZZa4Q1hDbH4SZC5IHPqi_QBmSiigPHAACgYKAYgSARASFQHGX2Mi3N21zLYOMAku61_CaeccrxoVAUF8yKo3X97N4REFyHP4du4RIo1b0076;' +
                    '__Secure-1PSIDTS=sidts-CjIB3EgAEmNr03Tidygwml9aTrgDf0woi14K6jndMv5Ox5uI22tYDMNEYiaAoEF0KjGYgRAA; __Secure-3PSIDTS=sidts-CjIB3EgAEmNr03Tidygwml9aTrgDf0woi14K6jndMv5Ox5uI22tYDMNEYiaAoEF0KjGYgRAA;' +
                    '__Secure-1PSID=g.a000lggw9yBHfdDri-OHg79Bkk2t6L2X7cbwK7jv8BYZZa4Q1hDbYpnHl6jq9y45aoBaqMd96QACgYKAR4SARASFQHGX2MiqFuOgRtuIS_FKmulaCrckxoVAUF8yKpX5r8ISh5S5eQ4eofBuyCg0076;' +
                    '__Secure-3PSID=g.a000lggw9yBHfdDri-OHg79Bkk2t6L2X7cbwK7jv8BYZZa4Q1hDb_8Q3teG8nn23ceeF8jiOvwACgYKAY0SARASFQHGX2MiwBtnenbu4CRMpjQza-asfhoVAUF8yKoFXx_Zxl4MvxGnWSSsnv1z0076;' +
                    'HSID=AWgIQn3iifuaU_eRW; SSID=AR8Jlj2XTnPAmL5kf; APISID=l6PTqM9Dy8G_2E6P/A-sAusHOyG1pQ3T75; SAPISID=OSmwE6VjdFmB1u5-/A2N-7DiRQUreUSpgT; __Secure-1PAPISID=OSmwE6VjdFmB1u5-/A2N-7DiRQUreUSpgT;' +
                    '__Secure-3PAPISID=OSmwE6VjdFmB1u5-/A2N-7DiRQUreUSpgT; LOGIN_INFO=AFmmF2swRQIgShGx2tfQkQV4F8lyKnh4mwj54yTOPJqEdI44sDTtsrwCIQD870Le1gTMDFpz7rRHS6Fk0HzraG_SxHw_PdyLjUDXxg:QUQ3MjNmeVpqbVhSQlNCMnFFZXBKQkhCTHJxY1NXOVlYcG50SHNNOGxGZGZ3Z2ZobWwyOW95WGJ2LVplelNaZ0RfbGU3Tm1uYktDdHBnVm9fd3N3T0NncVpTN0ZaNlRoTTVETDJHSjV6QkxUWmdYWGx0eVFYeEFqa0gxUGdBYUJKbG5oQ2pBd3RBb0ROWXBwcFQwYkpBRktEQXlWbmZIbHJB;' +
                    'SIDCC=AKEyXzXkXTftuhPOtObUSCLHxp1byOAtlesMkptSGp8hyE3d97Dvy2UHd4-2ePWBpzUbQhV6; __Secure-1PSIDCC=AKEyXzXlrhkCIONPS4jCvhmtFb8nAKr8fEFCCFEFqN8BKyrw8tKHFh3-r8EWjrqjAKH9Z9fq0A; __Secure-3PSIDCC=AKEyXzWLIbNbh8dxdyKhTafkyKIbEBwVKGR4lNRhhYX5u_v1k4vBnu4eAS9lgpP-JK2PgiSDJw'
            }]);
        const isURLValid = ytdl.validateURL(text);
        let videoId;
        if (isURLValid) {
            videoId = ytdl.getVideoID(text);
        }
        else {
            const { videos } = await yts(text);
            if (!videos.length) {
                videoId = undefined;
            }
            else {
                videoId = videos[0].videoId;
            }
        }
        if (!videoId) {
            return null;
        }
        const videoInfo = await ytdl.getInfo(videoId, { agent: yt_agent });
        const formats = ytdl.filterFormats(videoInfo.formats, 'videoandaudio');
        const format = ytdl.chooseFormat(formats, { quality: 'highest' });
        const ytInfo = {
            id_video: videoInfo.videoDetails.videoId,
            title: videoInfo.videoDetails.title,
            description: videoInfo.videoDetails.description || '',
            duration: Number(videoInfo.videoDetails.lengthSeconds),
            channel: videoInfo.videoDetails.author.name,
            is_live: videoInfo.videoDetails.isLive,
            duration_formatted: formatSeconds(Number(videoInfo.videoDetails.lengthSeconds)),
            url: format.url
        };
        return ytInfo;
    }
    catch (err) {
        showConsoleLibraryError(err, 'youtubeMedia');
        throw new Error(getBotTexts().library_error);
    }
}
