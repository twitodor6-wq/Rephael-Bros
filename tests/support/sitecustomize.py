# Optional wall-clock scaling for software-rendered browser QA. Never changes game dt/physics.
import os
scale=float(os.environ.get('RB_QA_WALL_SCALE','1'))
if scale!=1:
 from playwright.sync_api import Page
 oldwait=Page.wait_for_function
 def wait(self,expression,**kw):
  kw['timeout']=kw.get('timeout',30000)*scale
  return oldwait(self,expression,**kw)
 Page.wait_for_function=wait
 oldtimeout=Page.wait_for_timeout
 def timeout(self,ms):return oldtimeout(self,ms if ms==36 else ms*scale)
 Page.wait_for_timeout=timeout
