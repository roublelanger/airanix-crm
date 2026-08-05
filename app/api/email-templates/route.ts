import { NextResponse } from 'next/server'

const emailTemplates = [
  {
    id: '1',
    name: 'Initial Outreach',
    subject: 'Quick Introduction - {{firstName}}',
    body: 'Hi {{firstName}},\n\nI came across your profile and thought we could discuss how our solution can help {{company}}.\n\nWould you be open for a quick 15-min call this week?\n\nBest regards,\nAiranix Team'
  },
  {
    id: '2',
    name: 'Follow-up After Demo',
    subject: 'Following up on our demo - {{firstName}}',
    body: 'Hi {{firstName}},\n\nThanks for taking the time to see our demo yesterday. Based on what we discussed, I think we can save your team significant time.\n\nLet me know if you have any questions!\n\nBest regards,\nAiranix Team'
  },
  {
    id: '3',
    name: 'Closing Follow-up',
    subject: 'Let\'s move forward - {{firstName}}',
    body: 'Hi {{firstName}},\n\nWe\'ve covered all the details and answered your questions. I\'d like to get you started this week.\n\nAre you ready to move forward?\n\nBest regards,\nAiranix Team'
  },
  {
    id: '4',
    name: 'Meeting Confirmation',
    subject: 'Confirming our meeting - {{firstName}}',
    body: 'Hi {{firstName}},\n\nConfirming our meeting scheduled for {{date}} at {{time}}.\n\nLooking forward to speaking with you!\n\nBest regards,\nAiranix Team'
  }
]

export async function GET() {
  return NextResponse.json(emailTemplates)
}
