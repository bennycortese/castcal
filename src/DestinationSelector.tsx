import React from 'react';
import { useAtom } from 'jotai';
import { selectedDestinationsAtom } from './atoms';
import { BorderBeam } from './@/components/magic/border-beam';

type Destination = {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiresToken?: string;
  comingSoon?: boolean;
};

const DESTINATIONS: Destination[] = [
  {
    id: 'notion',
    name: 'Notion',
    icon: '𝒩',
    description: 'Database in your connected workspace',
  },
  {
    id: 'airtable',
    name: 'Airtable',
    icon: '⬡',
    description: 'Base with full calendar schema',
    requiresToken: 'Add Airtable token in Profile',
  },
  {
    id: 'csv',
    name: 'Google Sheets',
    icon: '⊞',
    description: 'Download as CSV, open in Sheets',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '#',
    description: 'Post summary to a channel',
    requiresToken: 'Add Slack webhook in Profile',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    icon: '⬡',
    description: 'Tasks in your CRM',
    requiresToken: 'Add HubSpot token in Profile',
  },
  {
    id: 'monday',
    name: 'Monday.com',
    icon: '▣',
    description: 'Items in your board',
    requiresToken: 'Add Monday token + board ID in Profile',
  },
  {
    id: 'trello',
    name: 'Trello',
    icon: '☰',
    description: 'Cards in a new board',
    requiresToken: 'Add Trello API key + token in Profile',
  },
];

interface DestinationSelectorProps {
  airtableToken: string | null;
  slackWebhookUrl: string | null;
  hubspotToken: string | null;
  mondayToken: string | null;
  mondayBoardId: string | null;
  trelloApiKey: string | null;
  trelloToken: string | null;
}

const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  airtableToken, slackWebhookUrl, hubspotToken, mondayToken, mondayBoardId, trelloApiKey, trelloToken,
}) => {
  const [selected, setSelected] = useAtom(selectedDestinationsAtom);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isDisabled = (d: Destination) => {
    if (d.comingSoon) return true;
    if (d.id === 'airtable' && !airtableToken) return true;
    if (d.id === 'slack' && !slackWebhookUrl) return true;
    if (d.id === 'hubspot' && !hubspotToken) return true;
    if (d.id === 'monday' && (!mondayToken || !mondayBoardId)) return true;
    if (d.id === 'trello' && (!trelloApiKey || !trelloToken)) return true;
    return false;
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Export to</p>
      <div className="grid grid-cols-2 gap-3">
        {DESTINATIONS.map((d) => {
          const disabled = isDisabled(d);
          const active = selected.has(d.id) && !disabled;

          return (
            <button
              key={d.id}
              onClick={() => !disabled && toggle(d.id)}
              disabled={disabled}
              className={`relative text-left p-4 rounded-xl border transition-all ${
                active
                  ? 'bg-violet-500/10 border-violet-500/30 shadow-lg shadow-violet-500/10'
                  : disabled
                  ? 'bg-white/3 border-white/5 opacity-40 cursor-not-allowed'
                  : 'glass-card hover:border-white/20 cursor-pointer'
              }`}
            >
              {/* Animated border beam on active cards */}
              {active && <BorderBeam size={120} duration={8} borderWidth={1.5} />}

              {d.comingSoon && (
                <span className="absolute top-2 right-2 text-[10px] font-medium text-violet-400/70 bg-violet-500/10 px-1.5 py-0.5 rounded-full">
                  Soon
                </span>
              )}

              <div className={`text-xl mb-2 font-bold ${active ? 'text-violet-300' : 'text-white/50'}`}>
                {d.icon}
              </div>
              <div className={`text-sm font-semibold mb-0.5 ${active ? 'text-white' : 'text-white/70'}`}>
                {d.name}
              </div>
              <div className="text-xs text-white/35 leading-snug">
                {disabled && !d.comingSoon ? d.requiresToken : d.description}
              </div>

              {active && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DestinationSelector;
