export function formatRelativeTime(date: Date) {
    const now = new Date();

    const diffInDays = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
        return "Today";
    } else if (diffInDays === 1) {
        return "Yesterday";
    } else {
        return `${diffInDays} days ago`;
    }
}