const toTime = (value) => {
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(time) ? 0 : time;
};

const formatDay = (value) => {
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "soon"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const isSecurityRequest = (visitor) =>
  visitor.registered_by_staff_id === undefined || visitor.registered_by_staff_id != null;

export const buildResidentNotificationItems = ({ notices = [], polls = [], visitors = [] }) => [
  ...notices.map((notice) => ({
    id: `notice-${notice.notice_id}`,
    type: "notice",
    label: notice.notice_type || "Notice",
    title: notice.title,
    message: notice.description,
    time: toTime(notice.publish_date),
    by: notice.posted_by_name,
    link: "/resident/notices",
    action: "Open notice",
    attention: false,
  })),
  ...polls
    .filter((poll) => poll.status === "Active" && poll.my_vote_option_id === null)
    .map((poll) => ({
      id: `poll-${poll.poll_id}`,
      type: "poll",
      label: "Poll",
      title: `Vote needed: ${poll.question}`,
      message: `Voting ends on ${formatDay(poll.end_date)}. Choose an answer before then.`,
      time: toTime(poll.created_at),
      link: "/resident/polls",
      action: "Vote now",
      attention: true,
    })),
  ...visitors.filter(isSecurityRequest).map((visitor) => {
    const pending = visitor.status === "Pending";
    const name = visitor.visitor_name || "A visitor";
    const time = visitor.expected_time ? String(visitor.expected_time).slice(0, 5) : "";
    const details = [visitor.purpose, time && `Visit time ${time}`].filter(Boolean).join(" · ");

    return {
      id: `visitor-${visitor.visitor_id}`,
      type: "visitor",
      label: pending ? "Visitor approval" : `Visitor ${String(visitor.status || "").toLowerCase()}`,
      title: pending ? `${name} is waiting for your approval` : `Visitor request for ${name}`,
      message: details || (pending ? "Approve or reject this visitor request." : ""),
      time: toTime(visitor.created_at || visitor.visit_date),
      link: "/resident/visitors",
      action: pending ? "Review" : "View visitors",
      attention: pending,
    };
  }),
];
