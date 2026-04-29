import { DeliveryRound } from '@prisma/client';
import { DateTime } from 'luxon';

export function calculateDeliveryRound(
    now = DateTime.now().setZone('Asia/Bangkok'),
) {
    const tenAm = now.set({
        hour: 10,
        minute: 0,
        second: 0,
        millisecond: 0,
    });

    const twoPm = now.set({
        hour: 14,
        minute: 0,
        second: 0,
        millisecond: 0,
    });

    if (now < tenAm) {
        return {
            deliveryRound: DeliveryRound.MORNING,
            deliveryDate: now.toJSDate(),
            deliveryText: 'รอบเช้า: ส่งภายใน 11:00 วันนี้',
        };
    }

    if (now < twoPm) {
        return {
            deliveryRound: DeliveryRound.AFTERNOON,
            deliveryDate: now.toJSDate(),
            deliveryText: 'รอบบ่าย: ส่งภายใน 15:00 วันนี้',
        };
    }

    const tomorrow = now.plus({ day: 1 }).startOf('day');

    return {
        deliveryRound: DeliveryRound.NEXT_DAY,
        deliveryDate: tomorrow.toJSDate(),
        deliveryText: 'รอบวันถัดไป',
    };
}
