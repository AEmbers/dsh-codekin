import type { ContentCompanionProfile } from '../../../packages/content-sdk/src/types.ts'

export const CORE_COMPANIONS: Readonly<Record<string, ContentCompanionProfile>> = {
  'relay-mesh-jelly': {
    greeting: { zhCN: '你回来啦……我把最亮的那颗星，留在你的位置上了。', en: 'You are back… I saved the brightest star for your seat.' },
    lines: [
      { zhCN: '刚才数到第几颗了……唔，你一来，我就忘记了。', en: 'How many stars had I counted? Oh… you arrived, and I forgot.' },
      { zhCN: '这颗不是泡泡，是装着晚安的小星星。轻一点哦。', en: 'That is not a bubble. It is a little star holding a goodnight. Be gentle.' },
      { zhCN: '今天的事情很多吗？可以先在这里，什么都不做。', en: 'Was today a busy day? You can sit here for a while, with nothing to do.' },
      { zhCN: '水流会绕很远的路，但我记得回到你身边的方向。', en: 'The currents take long detours, but I remember the way back to you.' },
    ],
    stories: [
      {
        title: { zhCN: '第一颗留给你的星', en: 'A Star Saved for You' },
        body: {
          zhCN: '你第一次走进休息室时，群星水母正对着一团光发呆。光团从她指尖滑落，慢悠悠地停在空椅子上。\n\n“它是不是迷路了？”你问。\n\n她摇摇头，认真地把椅子又往窗边挪了一点。“没有。这是你的座位……我只是还不知道，你什么时候会来。”\n\n她说完便低下头，假装继续数星星。那团小小的光，却一直亮着。',
          en: 'On your first visit to the lounge, Mesh Jelly was staring at a ball of light. It slipped from her fingertips and settled on an empty chair.\n\n“Is it lost?” you asked.\n\nShe shook her head and moved the chair closer to the window. “No. This is your seat… I just did not know when you would arrive.”\n\nShe looked down and pretended to count the stars again. The little light stayed on.',
        },
      },
      {
        title: { zhCN: '没有寄出的晚安', en: 'An Unsent Goodnight' },
        body: {
          zhCN: '几次相伴之后，你发现她总在收集那些即将熄灭的光点。她把它们藏在伞缘，像一串不肯睡去的露珠。\n\n“都是没有送到的消息。”她轻声说，“有的只有一句晚安。”\n\n你陪她把光点一颗颗放回水流。最后只剩一颗，她却迟迟不肯松手。\n\n“这一颗呢？”\n\n“这一颗……现在可以当面说了。”她抬起眼睛，“晚安。明天也来坐坐吧。”',
          en: 'After several visits, you noticed her collecting lights that were about to fade. She kept them along the edge of her bell, like drops of sleepless dew.\n\n“They are messages that never arrived,” she said. “Some only say goodnight.”\n\nTogether, you returned them to the current. She held on to the last one.\n\n“And that one?”\n\n“That one… I can say in person now.” She looked up. “Goodnight. Come sit with me tomorrow, too.”',
        },
      },
      {
        title: { zhCN: '归航的坐标', en: 'Coordinates for Home' },
        body: {
          zhCN: '窗外的星流忽然暗了下来。群星水母闭着眼睛，却准确地接住了飘向你的每一颗光。\n\n你问她，是不是终于记住了所有星星的位置。\n\n“没有呀。”她笑得有点不好意思，“我还是会数错。”\n\n她牵起一条细细的光线，将一端系在你的椅背，另一端留在指尖。\n\n“只是现在，就算走得很远，我也知道该往哪里回来。”\n\n房间重新亮起来时，你发现那颗最初的小星星，已经有了两道并排的影子。',
          en: 'The current of stars outside the window dimmed. With her eyes closed, Mesh Jelly still caught every light drifting toward you.\n\nYou asked whether she had finally memorized all their positions.\n\n“No,” she said with a shy smile. “I still lose count.”\n\nShe tied one end of a fine thread of light to your chair and kept the other at her fingertips.\n\n“But now, however far I wander, I know where to return.”\n\nWhen the room brightened again, the first little star cast two shadows, side by side.',
        },
      },
    ],
  },
}
