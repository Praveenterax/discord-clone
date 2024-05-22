import { db } from './db';

const findConversation = async (memberOneId: string, memberTwoId: string) => {
  try {
    const conversation = await db?.conversation?.findFirst({
      where: {
        OR: [
          { AND: [{ memberOneId }, { memberTwoId }] },
          { AND: [{ memberOneId: memberTwoId }, { memberTwoId: memberOneId }] },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });
    return conversation;
  } catch (err) {
    return null;
  }
};

const createNewConversation = async (
  memberOneId: string,
  memberTwoId: string
) => {
  try {
    const newConverSation = await db?.conversation?.create({
      data: {
        memberOneId,
        memberTwoId,
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });
    return newConverSation;
  } catch (err) {
    return null;
  }
};

export const getOrCreateConversation = async (
  memberOneId: string,
  memberTwoId: string
) => {
  try {
    let conversation = await findConversation(memberOneId, memberTwoId);

    if (!conversation) {
      conversation = await createNewConversation(memberOneId, memberTwoId);
    }

    return conversation;
  } catch (err) {
    return null;
  }
};
