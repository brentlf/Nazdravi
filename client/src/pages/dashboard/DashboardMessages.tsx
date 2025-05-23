import { MessageThread } from "@/components/dashboard/MessageThread";

export default function DashboardMessages() {
  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Chat with your nutritionist and get answers to your questions
          </p>
        </div>

        {/* Message Thread */}
        <div className="max-w-4xl mx-auto">
          <MessageThread />
        </div>

        {/* Tips Section */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6">
            <h3 className="font-semibold mb-3">💡 Tips for effective communication</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Be specific about your questions or concerns</li>
              <li>• Share any challenges you're facing with your nutrition plan</li>
              <li>• Ask for clarification if something isn't clear</li>
              <li>• Update your nutritionist on your progress regularly</li>
              <li>• Don't hesitate to ask for recipe modifications or alternatives</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
